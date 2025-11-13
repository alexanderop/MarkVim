Feature: Accessibility Compliance
  As a user
  I want the application to be accessible
  So that everyone can use MarkVim effectively

  Scenario: Default application state is accessible
    Given I navigate to the App
    When the page is loaded
    Then the page should have no accessibility violations

  Scenario: Document creation is accessible
    Given I navigate to the App
    When the page is loaded
    And I create a new document
    Then the page should have no accessibility violations

  Scenario: Color theme picker meets WCAG 2.1 AA standards
    Given I navigate to the App
    When I open the color theme modal
    Then the page should meet WCAG "2.1 AA" standards

  Scenario: Settings modal is accessible
    Given I navigate to the App
    When I open settings
    Then the page should have no accessibility violations

  Scenario: Keyboard shortcuts modal is accessible
    Given the keyboard shortcuts modal is open
    Then the page should have no accessibility violations

  Scenario: Document list sidebar is accessible
    Given I navigate to the App
    And the sidebar is visible
    Then the page should have no accessibility violations

  Scenario: Share functionality is accessible
    Given I navigate to the App
    When I click the share button
    Then the page should have no accessibility violations

  Scenario: Editor-only mode has no critical accessibility violations
    Given I navigate to the App
    When I click on editor mode
    Then the page should have no critical accessibility violations

  Scenario: Preview-only mode has no critical accessibility violations
    Given I navigate to the App
    When I click on preview mode
    Then the page should have no critical accessibility violations
