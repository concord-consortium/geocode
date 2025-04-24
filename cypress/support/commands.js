import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command'
import 'cypress-commands';

addMatchImageSnapshotCommand({ //need to fine tune thresholds
    failureThreshold: 0.05, // threshold for entire image
    failureThresholdType: 'percent', // percent of image or number of pixels
    customDiffConfig: { threshold: 0.1 }, // threshold for each pixel
    capture: 'viewport' // capture viewport in screenshot
  })
