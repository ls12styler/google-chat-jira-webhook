# JIRA Webhook Config

```
{
  "name": "GCP Arch Webhook",
  "url": "https://${MY_GCP_REGION}-${MY_GCP_PROJECT}.cloudfunctions.net/JIRAWebhook",
  "events": [
    "jira:issue_created"
  ],
  "filters": {
    "issue-related-events-section": "project = ${JIRA_PROJECT_NAME} and status = Backlog and issuetype != Epic"
  },
  "excludeBody" : false
}
```

# Testing locally

Start emulator:
```
npm start
```

Send request to function:
```
curl localhost:8081 -X POST -H "Content-Type: application/json; charset=UTF-8" -d@./examples/issue_created.json
```

# Deploying

Deployment uses the `gcloud` CLI to deploy the funciton to Google Cloud and so you need to be logged into `gcloud` through `gcloud auth login`.

By default the function deploys to the `europe-west2` region and has the `--allow-unauthenticated` parameter set.

Once authorised, you can run `npm run gcp-deploy`. To add additional arguments to `gcloud` simply add `-- --my-param=name`.
E.g to deploy into a sepcific project you can run `npm run gcp-deploy -- --project=my-gcp-project`

# Adding Channels

The function uses the "Components" field in JIRA to decide where to post messages. Before you modify the function, you need to have both the textual name for the component (i.e "Data") and a webhook URL from Google Chat (see [Create a webhook](https://developers.google.com/chat/how-tos/webhooks#create_a_webhook))

To add or change a destination, simply update the `componentSpaceMap` property to include the webhook URL for the component key. E.g
```
const componentSpaceMap = {
  "My Component": "https://my.google.chat/api/webhook/url?key=12e234234wfrreht,
  ...
}
```
