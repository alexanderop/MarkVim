Feature: Feature Flags
  As a user
  I want to enable/disable features
  So that I can customize my MarkVim experience

  Background:
    Given I navigate to the App
    And the page is loaded

  Scenario: Disabling share feature hides share button
    Given I open the settings modal
    When I disable the "share" feature
    And I close the settings modal
    Then the share button should not be visible in the toolbar

  Scenario: Disabling documents feature hides document sidebar
    Given I open the settings modal
    When I disable the "documents" feature
    And I close the settings modal
    Then the document list sidebar should not be visible
    And the delete document button should not be visible

  Scenario: Disabling color theme feature hides color theme button
    Given I open the settings modal
    When I disable the "color-theme" feature
    And I close the settings modal
    Then the color theme button should not be visible in the toolbar

  Scenario: Feature flags persist across page reloads
    Given I open the settings modal
    When I disable the "color-theme" feature
    And I disable the "shortcuts" feature
    And I close the settings modal
    When I reload the page
    Then the color theme button should not be visible
    And the keyboard shortcuts button should not be visible

  Scenario: Re-enabling features shows UI elements
    Given I open the settings modal
    And I disable the "share" feature
    And I close the settings modal
    When I open the settings modal
    And I enable the "share" feature
    And I close the settings modal
    Then the share button should be visible in the toolbar

  Scenario: Multiple features can be toggled independently
    Given I open the settings modal
    When I disable the "share" feature
    And I disable the "color-theme" feature
    And I close the settings modal
    Then the share button should not be visible
    And the color theme button should not be visible
    And the document list sidebar should be visible

  Scenario: Feature flags reset with clear data
    Given I open the settings modal
    And I disable the "share" feature
    And I disable the "color-theme" feature
    When I click the clear-data button
    And I click the clear-data-confirm button
    And the page is loaded
    Then the share button should be visible in the toolbar
    And the color theme button should be visible in the toolbar
