![ts](https://badgen.net/badge/Built%20With/TypeScript/blue)
[![Formatted with Biome](https://img.shields.io/badge/Formatted_and_Linted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

# azf-send-sms

HttpTriggered sending of SMS with [MyLink / LinkMobility](https://www.linkmobility.com/docs/api-reference/mylink-sms-api)

## Usage

### Send SMS immediately

POST JSON to function.

```json
{
  "receivers": ["4798765432", "+4745678912"],
  "message": "<message>",
  "sender": "<name-or-number>",
  "referenceId": "<your-reference-id>"
}
```

> `receivers` - **Required** - must be provided in MSISDN format. Example: 4798765432 or +4745678912<br />
> `message` - **Required**<br />
> `referenceId` - **Required** - your own reference id for tracking<br />
> `sender` - *Optional* - default is set in environment variable `DEFAULT_SENDER`<br />

### Send SMS scheduled in the future

POST JSON to function.

```json
{
  "receivers": ["4798765432", "+4745678912"],
  "message": "<message>",
  "sender": "<name-or-number>",
  "referenceId": "<your-reference-id>",
  "scheduledIn": 3600000,
  "scheduledAt": "2025-09-19T16:00:00Z"
}
```

> `receivers` - **Required** - must be provided in MSISDN format. Example: 4798765432 or +4745678912<br />
> `message` - **Required**<br />
> `referenceId` - **Required** - your own reference id for tracking<br />
> `sender` - *Optional* - default is set in environment variable `DEFAULT_SENDER`<br />
> `scheduledIn` - *Optional* - milliseconds in the future to schedule the SMS - Min: 600_000 ms (10 minutes). Max: 7_889_232_000 ms (3 months)<br />
> `scheduledAt` - *Optional* - ISO8601 date time string in UTC to schedule the SMS - Min: 10 minutes in the future. Max: 3 months in the future<br />

> [!IMPORTANT]
> Use either `scheduledIn` or `scheduledAt` to schedule the SMS.<br />
> If both are provided, `scheduledAt` will be used.

```
$ curl https://<api-url>.no/api/SendSms -d "{ "receivers": ["4745678912"], "message": "Do you read me?", "referenceId": "<your-reference-id>", "scheduledAt": "2025-09-19T16:00:00Z" }" -H "Content-Type: application/json" -H "x-functions-key: <your-api-key>" -v
```

### Get scheduled SMS messages

GET request to function. Size parameter defaults to 25

```
$ curl https://<api-url>.no/api/scheduled/messages -H "x-functions-key: <your-api-key>" -v
```

GET request to function with specified size parameter

```
$ curl https://<api-url>.no/api/scheduled/messages?size=50 -H "x-functions-key: <your-api-key>" -v
```

### Get scheduled SMS message by UUID

GET request to function.

```
$ curl https://<api-url>.no/api/scheduled/messages/{messageId} -H "x-functions-key: <your-api-key>" -v
```

### Delete scheduled SMS message by UUID

DELETE request to function.

```
$ curl -X DELETE https://<api-url>.no/api/scheduled/messages/{messageId} -H "x-functions-key: <your-api-key>" -v
```

Will return 204 No Content if successful.

## Development

Create a `local.settings.json` file:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MYLINK_BASEURL": "https://api.linkmobility.com/sms/v1",
    "MYLINK_TOKENURL": "https://sso.linkmobility.com/auth/realms/CPaaS/protocol/openid-connect/token",
    "MYLINK_CLIENT_ID": "client-id-generated-in-mylink",
    "MYLINK_CLIENT_SECRET": "client-secret-generated-in-mylink",
    "MYLINK_OBFUSCATION": "Content",
    "DEFAULT_SENDER": "MyCompany"
  }
}
```

**MYLINK_OBFUSCATION**<br />
This setting controls if/how the message is obfuscated in MyLink logs. If not given, the default is `Content`<br />
Can be one of `None`, `Content` or `ContentAndRecipient`

POST testdata

```
$ curl http://localhost:7071/api/SendSMS -d "{ "receivers": ["+4745678912"], "message": "Do you read me?" }" -H "Content-Type: application/json" -v
```

# License

[MIT](LICENSE)
