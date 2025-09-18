[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

# azf-send-sms

HttpTriggered sending of SMS with [PSWinCom/LinkMobility](https://pswin.com/)

# Usage

POST json to function.

```json
{
  "receivers": ["4798765432", "4745678912"],
  "message": "<message>",
  "sender": "<name-or-number>",
  "operation": 9
}
```

> `receivers` - **Required** - (10 digits) - must have country codes prefixed!<br />
> `message` - **Required**<br />
> `sender` - *Optional* - default is set in environment variable `DEFAULT_SENDER`<br />
> `operation` - *Optional*

```
$ curl https://<api-url>.no/api/SendSms -d "{ "receivers": ["4745678912"], "message": "Do you read me?" }" -H "Content-Type: application/json" -H "x-functions-key: <your-api-key>" -v
```

## Development

Create a `local.settings.json` file:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "PSWIN_USERNAME": "username",
    "PSWIN_PASSWORD": "password",
    "DEFAULT_SENDER": "VFK"
  }
}
```

POST testdata

```
$ curl http://localhost:7071/api/SendSMS -d "{ "receivers": ["+4745678912"], "message": "Do you read me?" }" -H "Content-Type: application/json" -v
```

# License

[MIT](LICENSE)
