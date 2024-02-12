import { HttpFunction } from "@google-cloud/functions-framework";
import axios from "axios"

const componentSpaceMap = {
  // ... "My Channel": "https://chat.googleapis.com/v1/spaces/xxxxx/messages?keyxxxxxx
}

export const JIRAWebhook: HttpFunction = async ({method, body, headers: {"content-type": contentType}}, res) => {

  if (method !== "POST") throw new Error("Invalid method")
  if (contentType === undefined || contentType.split(";")[0] !== "application/json") throw new Error("Invalid Content-Type")

  console.log({contentType})
  console.log(JSON.stringify(body))

  type Component = {
    self: string;
    id: string;
    name: keyof typeof componentSpaceMap;
  }
  const comps = body.issue.fields.components as Component[]
  // post a message in each space in the componentSpaceMap
  comps.map(async (component) => {
    // If the component doesn't exist in the map, skip it
    if (!Object.keys(componentSpaceMap).includes(component.name)) return

    // Look up the chat hook url
    const dest = componentSpaceMap[component.name]

    // Create the message to post
    const data = createMessage(body.issue)

    // Post the message
    try {
      await axios.post(dest, data)
      await axios.post(dest, JSON.stringify(body))
    } catch (e: any) {
      console.log(e.response.data)
    }
  })

  res.send("ok")
}

function createMessage({key, fields: {summary, description, customfield_13009: salesforceUrl}}: any) {
  const header = {
    title: summary,
    imageUrl: "https://images.emojiterra.com/google/android-12l/512px/1f4ec.png",
    imageType: "SQUARE",
    imageAltText: "New Opportunity!"
  };

  const buttons = [
    {
      text: "Open JIRA",
      onClick: {
        openLink: {
          url: `https://cts-gcp.atlassian.net/browse/${key}`,
        }
      }
    }
  ]

  if (salesforceUrl !== undefined && salesforceUrl !== null) {
    buttons.push(
      {
        text: "Open Salesforce",
        onClick: {
          openLink: {
            url: salesforceUrl,
          }
        }
      }
    )
  }

  const sections = [{
    header: "Here are the opportunity details:",
    //collapsible: true,
    widgets: [
      {
        textParagraph: {
          text: description
        }
      },
      {
        buttonList: {
          buttons
        }
      }
    ]
  }]

  return {
    cardsV2: [{
      cardId: 'newOppCard',
      card: {
        name: 'New Opportunity Card',
        header,
        sections
      }
    }],
  };
}
