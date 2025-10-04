/**
 * Feature Flags Module Events
 *
 * This file defines all events emitted or consumed by the feature-flags module.
 */

import type { FeatureName } from './store'

export interface FeatureFlagsEvents {
  'feature:toggle': { feature: FeatureName }
  'feature:enable': { feature: FeatureName }
  'feature:disable': { feature: FeatureName }
  'feature:reset': undefined
}
