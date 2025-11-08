// Workers Index
// Imports all workers to start them
// Workers are started automatically when imported

import './file-processing.worker.js'
import './notifications.worker.js'
import './external-api.worker.js'
import './scheduled.worker.js'

console.log('[Workers] All workers started successfully')
