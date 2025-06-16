# tests/features/scroll-sync.feature

Feature: Scroll Synchronization
  As a user
  I want the editor and preview panes to scroll in sync when in split view
  So that I can easily track my position in long documents.

  Background:
    Given I navigate to the App
    And the page is loaded
    And I create a document with long content for scrolling
    And I am in split view

  Scenario: Editor scrolls preview by default
    Given synchronized scrolling is enabled
    When I scroll down in the editor pane
    Then the preview pane should scroll proportionally

  Scenario: Preview scrolls editor by default
    Given synchronized scrolling is enabled
    When I scroll down in the preview pane
    Then the editor pane should scroll proportionally

  Scenario: Disabling scroll sync stops synchronization
    Given synchronized scrolling is enabled
    When I open the settings modal
    And I disable synchronized scrolling
    And I close the settings modal
    And I scroll down in the editor pane
    Then the preview pane should not scroll

  Scenario: Re-enabling scroll sync resumes synchronization
    Given I have disabled synchronized scrolling in the settings
    When I open the settings modal
    And I enable synchronized scrolling
    And I close the settings modal
    And I scroll down in the editor pane
    Then the preview pane should scroll proportionally

  Scenario: Scroll sync is not active in editor-only view
    Given synchronized scrolling is enabled
    When I switch to editor-only view
    Then scroll synchronization should not be active

  Scenario: Scroll sync is not active in preview-only view
    Given synchronized scrolling is enabled
    When I switch to preview-only view
    Then scroll synchronization should not be active 