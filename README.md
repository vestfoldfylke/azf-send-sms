![ESLint Badge](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=fff&style=flat-square)

# azf-send-sms

HttpTriggered sending of SMS with [MyLink / LinkMobility](https://www.linkmobility.com/docs/api-reference/mylink-sms-api)

## Usage

### Send SMS immediately

POST json to function.

```json
{
  "receivers": ["+4798765432", "+4745678912"],
  "message": "<message>",
  "sender": "<name-or-number>",
  "referenceId": "<your-reference-id>"
}
```

> `receivers` - **Required** - must be provided in MSISDN format. Example: +4781549300<br />
> `message` - **Required**<br />
> `sender` - *Optional* - default is set in environment variable `DEFAULT_SENDER`<br />
> `referenceId` - *Optional* - your own reference id for tracking<br />

### Send SMS scheduled in the future

POST json to function.

```json
{
  "receivers": ["+4798765432", "+4745678912"],
  "message": "<message>",
  "sender": "<name-or-number>",
  "referenceId": "<your-reference-id>",
  "scheduledIn": 3600000,
  "scheduledAt": "2025-09-19T16:00:00Z"
}
```

> `receivers` - **Required** - must be provided in MSISDN format. Example: +4781549300<br />
> `message` - **Required**<br />
> `sender` - *Optional* - default is set in environment variable `DEFAULT_SENDER`<br />
> `referenceId` - *Optional* - your own reference id for tracking<br />
> `scheduledIn` - *Optional* - milliseconds in the future to schedule the SMS<br />
> `scheduledAt` - *Optional* - ISO8601 date time string in UTC to schedule the SMS

> [!IMPORTANT]
> Use either `scheduledIn` or `scheduledAt` to schedule the SMS.<br />
> If both are provided, `scheduledAt` will be used.

```
$ curl https://<api-url>.no/api/SendSms -d "{ "receivers": ["4745678912"], "message": "Do you read me?", "referenceId": "<your-reference-id>", "scheduledAt": "2025-09-19T16:00:00Z" }" -H "Content-Type: application/json" -H "x-functions-key: <your-api-key>" -v
```

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
    "DEFAULT_SENDER": "MyCompany"
  }
}
```

POST testdata

```
$ curl http://localhost:7071/api/SendSMS -d "{ "receivers": ["+4745678912"], "message": "Do you read me?" }" -H "Content-Type: application/json" -v
```

# License

[MIT](LICENSE)
