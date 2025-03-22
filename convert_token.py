import pickle
import json

# Load the pickle file
with open('token.pickle', 'rb') as token:
    creds = pickle.load(token)

# Convert to dictionary format
token_data = {
    'access_token': creds.token,
    'refresh_token': creds.refresh_token,
    'scope': creds.scopes,
    'token_type': 'Bearer',
    'expiry_date': int(creds.expiry.timestamp() * 1000) if creds.expiry else None
}

# Save as JSON
with open('token.json', 'w') as f:
    json.dump(token_data, f)

print("Token converted and saved to token.json") 