import {LambdaClient, UpdateFunctionCodeCommand} from '@aws-sdk/client-lambda';
import {readFile} from 'fs/promises';
import {join} from 'path';
import dotenv from 'dotenv';

dotenv.config({path: '.env'});
const FUNCTION_NAME_CHAT = process.env.AWS_LAMBDA_FUNCTION_NAME_CHAT;
if (!FUNCTION_NAME_CHAT) {
    console.error('Error: AWS_LAMBDA_FUNCTION_NAME_CHAT environment variable is not set');
    process.exit(1);
}
const FUNCTION_NAME_GMAIL = process.env.AWS_LAMBDA_FUNCTION_NAME_GMAIL;
if (!FUNCTION_NAME_GMAIL) {
    console.error('Error: AWS_LAMBDA_FUNCTION_NAME_GMAIL environment variable is not set');
    process.exit(1);
}

async function updateLambdaFunction(functionName) {
    try {
        // Read the ZIP file
        const zipFilePath = join(process.cwd(), 'function.zip');
        const zipFile = await readFile(zipFilePath);

        // Initialize Lambda client
        const client = new LambdaClient();

        // Create update command
        const command = new UpdateFunctionCodeCommand({
            FunctionName: functionName,
            ZipFile: zipFile
        });

        // Update the function
        console.log(`Updating Lambda function: ${functionName}`);
        const response = await client.send(command);
        console.log('Update successful!');
        console.log('Function ARN:', response.FunctionArn);
        console.log('Last Modified:', response.LastModified);
        console.log('Code SHA256:', response.CodeSha256);
    } catch (error) {
        console.error('Error updating Lambda function:', error);
        process.exit(1);
    }
}

updateLambdaFunction(FUNCTION_NAME_CHAT);
updateLambdaFunction(FUNCTION_NAME_GMAIL);
