Feature: Settings Modal
  As a user of MarkVim
  I want to access and configure application settings
  So I can customize my editing experience.

  Scenario: A user can open the settings modal with keyboard shortcut
    Given I am on the MarkVim application
    When I press "g" then "s"
    Then the settings modal should be open
    And I should see the title "Settings"

  Scenario: A user can open the settings modal with the toolbar button
    Given I am on the MarkVim application
    When I click the "Settings" button in the toolbar
    Then the settings modal should be open
    And I should see the title "Settings"

  Scenario: A user can close the settings modal with Escape key
    Given I am on the MarkVim application
    And the settings modal is open
    When I press "Escape"
    Then the settings modal should be closed 