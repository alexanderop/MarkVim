Feature: Settings Theme Selection

  Background:
    Given I am on the MarkVim homepage
    And I open the settings modal

  Scenario: Change theme to light
    When I change the theme to "light"
    Then the theme should be stored in localStorage as "light"

  Scenario: Theme preference persists across reloads
    When I change the theme to "light"
    And I press the key "Escape"
    And I reload the page
    When I open the settings modal
    Then the theme should be stored in localStorage as "light"
