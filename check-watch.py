from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os.path
import pickle
from datetime import datetime
import logging
import sys
import json
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gmail_watch.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_gmail_service():
    creds = None
    token_path = os.path.join(SCRIPT_DIR, 'token.pickle')
    creds_path = os.path.join(SCRIPT_DIR, 'credentials.json')
    
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(creds_path):
                logging.error(f"Credentials file not found at {creds_path}")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)
    
    return build('gmail', 'v1', credentials=creds)

def format_expiration(expiration):
    # Convert milliseconds to datetime
    return datetime.fromtimestamp(int(expiration)/1000).strftime('%Y-%m-%d %H:%M:%S')

def create_message(sender, to, subject, message_text):
    message = MIMEMultipart()
    text_part = MIMEText(message_text, 'plain')
    html_part = MIMEText(f"<h1>{subject}</h1><p>{message_text}</p>", 'html')
    
    message.attach(text_part)
    message.attach(html_part)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    return {'raw': raw_message}

def main():
    try:
        gmail = get_gmail_service()
        
        # First, get the user's email address
        profile = gmail.users().getProfile(userId='me').execute()
        email_address = profile.get('emailAddress')
        logging.info(f"Authenticated as: {email_address}")
        
        # Then set up the watch
        watch_request = {
            'labelIds': ['INBOX'],
            'topicName': 'projects/gmail-webhook-454508/topics/MailHook',
            'labelFilterBehavior': 'INCLUDE',
            'filter': {
                'criteria': {
                    'from': email_address
                }
            }
        }
        logging.info(f"Setting up watch with request: {json.dumps(watch_request, indent=2)}")
        
        watch_response = gmail.users().watch(userId='me', body=watch_request).execute()
        
        expiration = format_expiration(watch_response.get('expiration'))
        logging.info("Watch request successful!")
        logging.info(f"History ID: {watch_response.get('historyId')}")
        logging.info(f"Expiration: {expiration}")
        logging.info(f"Topic Name: {watch_response.get('topicName')}")
        logging.info(f"Full watch response: {json.dumps(watch_response, indent=2)}")
        
        # Test if we can receive notifications
        logging.info("Testing notification by sending a test email...")
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = create_message(
            email_address,
            email_address,
            f'Gmail API Test Email [{current_time}]',
            f'This is a test email sent at {current_time} to verify Gmail API notifications.\n\n' +
            'If you receive this email, the Gmail API send functionality is working correctly.\n\n' +
            'You should also see a notification in your Pub/Sub topic shortly.'
        )
        sent_message = gmail.users().messages().send(userId='me', body=message).execute()
        logging.info(f"Test email sent successfully! Message ID: {sent_message.get('id')}")
        
        # Verify the message was sent by trying to retrieve it
        sent_message_details = gmail.users().messages().get(userId='me', id=sent_message.get('id')).execute()
        logging.info(f"Message details retrieved. Labels: {sent_message_details.get('labelIds', [])}")
        
        # Get the history since the watch was set up
        history = gmail.users().history().list(
            userId='me',
            startHistoryId=watch_response.get('historyId')
        ).execute()
        
        if history.get('history'):
            logging.info(f"Found {len(history['history'])} history entries since watch was set up")
            for entry in history['history']:
                logging.info(f"History entry: {json.dumps(entry, indent=2)}")
        else:
            logging.info("No history entries found since watch was set up")
        
        return 0
    except Exception as e:
        logging.error(f"Error in watch setup: {str(e)}")
        if hasattr(e, 'content'):
            logging.error(f"Error details: {e.content.decode()}")
        return 1

if __name__ == '__main__':
    sys.exit(main()) 