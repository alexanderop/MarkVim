Feature: Synchronized Scrolling

  Scenario: User enables sync scroll and verifies synchronization works in split view
    Given I open the MarkVim homepage
    And I switch to split view mode
    And I create a document with long content for scrolling
    When I open the settings modal
    And I enable synchronized scrolling
    And I close the settings modal
    Then synchronized scrolling should be enabled
    When I scroll down in the editor pane
    Then the preview pane should scroll proportionally
    When I scroll up in the preview pane
    Then the editor pane should scroll proportionally

  Scenario: User disables sync scroll and verifies scrolling is independent
    Given I open the MarkVim homepage
    And I switch to split view mode
    And I create a document with long content for scrolling
    And synchronized scrolling is enabled
    When I open the settings modal
    And I disable synchronized scrolling
    And I close the settings modal
    Then synchronized scrolling should be disabled
    When I scroll down in the editor pane
    Then the preview pane should not scroll
    When I scroll down in the preview pane
    Then the editor pane should not scroll

  Scenario: Sync scroll only works in split view mode
    Given I open the MarkVim homepage
    And I create a document with long content for scrolling
    And synchronized scrolling is enabled
    When I switch to editor only view
    Then sync scroll should not be active
    When I switch to preview only view
    Then sync scroll should not be active
    When I switch to split view mode
    Then sync scroll should be active

  Scenario: Sync scroll toggle with keyboard shortcut
    Given I open the MarkVim homepage
    And I switch to split view mode
    And I create a document with long content for scrolling
    When I press "p" to toggle preview sync
    Then the preview sync state should change
    And the settings should reflect the new sync state
    When I press "p" to toggle preview sync again
    Then the preview sync state should change back
    And the settings should reflect the reverted sync state 