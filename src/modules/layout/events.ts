/**
 * Layout Module Events
 *
 * Events that the layout module publishes and responds to.
 */

export interface LayoutEvents {
  /** Switch the main view mode. */
  'view:set': {
    viewMode: 'editor' | 'split' | 'preview'
  }

  /** Toggle the sidebar. */
  'sidebar:toggle': undefined
}
