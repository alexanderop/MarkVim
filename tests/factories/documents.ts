import type { Document } from '~/shared/types/Document'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

export const documentFactory = Factory.define<Document>(({ sequence }) => {
  const content = faker.lorem.paragraphs(3)
  const createdAt = faker.date.recent().getTime()

  return {
    id: `doc-${sequence}`,
    content: `# ${faker.lorem.sentence()}\n\n${content}`,
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: Date.now() }).getTime(),
  }
})
