Feature: Color Theme Customization
  As a user,
  I want to change the colors of the application theme
  So that my changes are reflected consistently across the UI.

  Background:
    Given I navigate to the App
    When the page is loaded

  Scenario: Changing the foreground color updates regular text elements
    Given I am on the application page
    When I open the color theme modal
    And I click the "Foreground" color setting to open the picker
    And I set the color picker value to "oklch(65% 0.25 20)" which is a vibrant red
    And I confirm the new color selection
    Then the text color of the editor content should be "rgb(242, 85, 93)"
    And the text color of the preview content should be "rgb(242, 85, 93)"
    And the text color of the document list title should be "rgb(242, 85, 93)"
    And the text color of the status bar should be "rgb(242, 85, 93)"

  Scenario: Changing the accent color updates heading elements
    Given I am on the application page
    And I type "# Main Heading" into the editor
    When I open the color theme modal
    And I click the "Accent" color setting to open the picker
    And I set the color picker value to "oklch(75% 0.30 120)" which is a vibrant green
    And I confirm the new color selection
    Then the heading color in the editor should be "rgb(48, 217, 93)"

  Scenario: Vim visual mode selection uses the muted color
    Given I am on the application page
    And I type the following text into the editor:
      """
      First line of text
      Second line of text
      Third line of text
      Fourth line of text
      """
    When I enable vim mode
    And I enter vim visual mode
    And I select 2 lines down in visual mode
    Then the vim mode indicator should show "VISUAL"
    And the selection background color should use the muted theme color 