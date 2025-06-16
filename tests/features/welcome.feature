Feature: Welcome Screen
  As a first-time user of MarkVim
  I want to be greeted by a welcome screen that explains the application's purpose and key features
  So that I can understand the value of the app before diving into the main editor interface

  Background:
    Given I am on a clean browser with no localStorage data

  Scenario: First-time user sees welcome screen
    When I visit the MarkVim application
    Then I should see the welcome screen
    And I should see the application title "MarkVim"
    And I should see the tagline "Markdown Editing at the Speed of Thought"
    And I should see feature cards for "Vim Modal Editing", "Live Preview", and "Fully Customizable"
    And I should see a "Start Writing" button
    And I should not see the main application interface

  Scenario: Welcome screen displays key features
    Given I visit the MarkVim application for the first time
    When I am on the welcome screen
    Then I should see a feature card for "Vim Modal Editing" with description about keybindings
    And I should see a feature card for "Live Preview" with description about real-time rendering
    And I should see a feature card for "Fully Customizable" with description about personalization

  Scenario: User proceeds to main application
    Given I am on the welcome screen
    When I click the "Start Writing" button
    Then I should be taken to the main application interface
    And I should see the editor interface
    And the welcome screen should be dismissed permanently

  Scenario: Returning user bypasses welcome screen
    Given I have previously seen the welcome screen
    When I visit the MarkVim application
    Then I should be taken directly to the main application interface
    And I should not see the welcome screen

  Scenario: Welcome screen is responsive
    Given I am on the welcome screen
    When I resize the browser to mobile size
    Then the welcome screen should remain readable and functional
    And the feature cards should stack vertically on small screens