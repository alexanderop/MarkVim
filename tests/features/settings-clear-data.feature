Feature: Settings Clear Local Data

  Background:
    Given I am on the MarkVim homepage

  Scenario: Settings modal contains clear data button
    When I open the settings modal
    Then the settings modal should be visible
    And I should see a "Clear Local Data" button

  Scenario: Clear data button removes all localStorage data
    Given I have some data stored in localStorage
    When I open the settings modal
    And I click the "Clear Local Data" button
    Then a confirmation modal should appear
    When I confirm the clear data action
    Then all localStorage data should be cleared
    And the confirmation modal should close
    And the settings modal should close

  Scenario: Clear data confirmation can be cancelled
    Given I have some data stored in localStorage
    When I open the settings modal
    And I click the "Clear Local Data" button
    Then a confirmation modal should appear
    When I cancel the clear data action
    Then the confirmation modal should close
    And all localStorage data should still exist

  Scenario: Clear data restores default settings
    Given I have modified settings in localStorage
    When I open the settings modal
    And I click the "Clear Local Data" button
    And I confirm the clear data action
    Then the view mode should be "split"
    And the editor settings should be reset to defaults
    And the sidebar should be visible 