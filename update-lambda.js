import {LambdaClient, UpdateFunctionCodeCommand} from '@aws-sdk/client-lambda';
import {readFile} from 'fs/promises';
import {join} from 'path';
import dotenv from 'dotenv';

dotenv.config({path: '.env'});
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME_CHAT;
if (!FUNCTION_NAME) {
    console.error('Error: AWS_LAMBDA_FUNCTION_NAME_CHAT environment variable is not set');
    process.exit(1);
}

async function updateLambdaFunction() {
    try {
        // Read the ZIP file
        const zipFilePath = join(process.cwd(), 'function.zip');
        const zipFile = await readFile(zipFilePath);

        // Initialize Lambda client
        const client = new LambdaClient();

        // Create update command
        const command = new UpdateFunctionCodeCommand({
            FunctionName: FUNCTION_NAME,
            ZipFile: zipFile
        });

        // Update the function
        console.log(`Updating Lambda function: ${FUNCTION_NAME}`);
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

updateLambdaFunction();
