import type { Document } from '~/shared/types/Document'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

export const documentFactory = Factory.define<Document>(({ sequence }) => {
  const content = faker.lorem.paragraphs(3)

  return {
    id: `doc-${sequence}`,
    content: `# ${faker.lorem.sentence()}\n\n${content}`,
    createdAt: faker.date.past().getTime(),
    updatedAt: faker.date.recent().getTime(),
  }
})
