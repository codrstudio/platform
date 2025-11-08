// Admin Routes
// BullBoard UI for queue management and monitoring

import { Router } from 'express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import {
  fileProcessingQueue,
  notificationsQueue,
  externalApiQueue,
  scheduledQueue,
} from '../services/queue.service.js'

const router = Router()

// Setup BullBoard server adapter
const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

// Create BullBoard with all queues
createBullBoard({
  queues: [
    new BullMQAdapter(fileProcessingQueue),
    new BullMQAdapter(notificationsQueue),
    new BullMQAdapter(externalApiQueue),
    new BullMQAdapter(scheduledQueue),
  ],
  serverAdapter,
})

// TODO: Add authentication middleware
// For now, allow access to all (development only)
// router.use('/queues', authMiddleware, serverAdapter.getRouter())

router.use('/queues', serverAdapter.getRouter())

console.log('[Admin Routes] BullBoard available at /admin/queues')

export default router
