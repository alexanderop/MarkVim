import type { Directive, WatchStopHandle } from 'vue'
import type { FeatureName } from '~/shared/api/feature-flags'

/**
 * Extended HTMLElement with cleanup function for the v-feature directive
 */
export interface FeatureElement extends HTMLElement {
  _vFeatureCleanup?: WatchStopHandle
}

/**
 * Type definition for the v-feature directive
 * Controls element visibility based on feature flag state
 *
 * @example
 * <button v-feature="'share'">Share</button>
 */
export type FeatureDirective = Directive<FeatureElement, FeatureName>

/**
 * Type augmentation for Vue directives
 * This enables TypeScript support for custom directives in Vue templates
 */
declare module 'vue' {
  export interface ComponentCustomProperties {
    vFeature: FeatureDirective
  }
}
