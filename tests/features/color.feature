Feature: Color Theme Management
  As a user
  I want to customize my editor colors using the color theme picker
  So that I can personalize my editing experience

  Background:
    Given I navigate to the App
    When the page is loaded

  Scenario: Open color theme modal with keyboard shortcut
    When I press the "gc" keyboard shortcut
    Then the "color theme modal" should be visible
    And the color theme modal should show the default colors