import { medusaClient } from "components/checkout/components/discount-code/config"

export const getCollectionIds = async (): Promise<string[]> => {
  const data = await medusaClient.collections
    .list({ limit: 100 })
    .then(({ collections }) => {
      return collections.map(({ id }) => id)
    })

  return data
}
