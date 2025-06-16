Feature: Welcome Screen
  As a first-time user of MarkVim
  I want to see a welcome screen
  So that I can understand the app and get started

  Scenario: First-time user sees welcome screen and can start
    Given I visit the MarkVim application for the first time
    Then I should see the welcome screen with "MarkVim" title
    And I should see a "Start Writing" button
    When I click the "Start Writing" button
    Then I should see the main editor interface
    And the welcome screen should not appear on subsequent visits