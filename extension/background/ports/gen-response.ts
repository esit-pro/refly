import { type PlasmoMessaging } from "@plasmohq/messaging"

import { TASK_STATUS, TASK_TYPE } from "~/types"
import { safeParseJSON } from "~utils/parse"
import { getServerOrigin } from "~utils/url"
import { fetchEventSource } from "~utils/fetch-event-source"
import { getCookie } from "~utils/cookie"

let abortController: AbortController

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { type, payload } = req?.body || {}
  console.log("receive request", req.body)

  try {
    if (type === TASK_STATUS.START) {
      abortController = new AbortController()

      // TODO: 这里未来要优化
      const messageItems = req.body?.payload?.data?.items || []
      const question = messageItems?.[messageItems.length - 1]?.data?.content
      const conversationId =
        messageItems?.[messageItems.length - 1]?.conversationId

      const cookie = await getCookie()

      await fetchEventSource(
        `${getServerOrigin()}/v1/conversation/${conversationId}/chat?query=${question}`,
        {
          method: "POST",
          body: JSON.stringify({
            weblinkList: [],
          }),
          headers: {
            Authorization: `Bearer ${cookie}`, // Include the JWT token in the Authorization header
          },
          onmessage(data) {
            if (data === "[DONE]") {
              console.log("EventSource done")
              res.send({ message: "[DONE]" })
            } else {
              res.send({ message: data })
            }
          },
          onerror(error) {
            console.log("EventSource failed:", error)

            // 这里是因为 evtSource 之后会进行重试
            // res.send({ message: "Meet Error" })
            res.send({ message: "[DONE]" })
          },
          signal: abortController.signal,
        },
      )
    } else if (type === TASK_STATUS.SHUTDOWN) {
      abortController.abort()
      res.send({ message: "[DONE]" })
    }
  } catch (err) {
    console.log("err", err)
  } finally {
    // 最终也需要 abort 确保关闭
    abortController?.abort?.()
  }
}

export default handler
