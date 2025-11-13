Feature: Application Smoke Test
  As a user
  I want to verify the basic functionality works when the application loads
  So that I can be confident the core features are operational

  Scenario: Switch to editor-only mode
    Given I navigate to the App
    When the page is loaded
    When I click on editor mode
    Then the selected mode should be "editor"
    And I should see the headline "Welcome to MarkVim" in the editor
    And I should not see the headline "Welcome to MarkVim" in the preview

  Scenario: Switch to preview-only mode
    Given I navigate to the App
    When the page is loaded
    When I click on preview mode
    Then the selected mode should be "preview"
    And I should not see the headline "Welcome to MarkVim" in the editor
    And I should see the headline "Welcome to MarkVim" in the preview

  Scenario: Font size adjustment works correctly
    Given I navigate to the App
    When the page is loaded
    And I change the font size to 18
    Then I verify the editor font size is 18px
    When I change the font size to 12
    Then I verify the editor font size is 12px
