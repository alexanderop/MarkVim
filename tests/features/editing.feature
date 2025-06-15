Feature: Core Editing and Preview
  As a user
  I want to write markdown and see it render correctly in real-time
  So that I can be sure my document is formatted as I expect.

  Background:
    Given I navigate to the App
    And the page is loaded

  Scenario: Real-time markdown rendering
    Given I have an empty document
    When I type "## My New Header" into the editor
    Then the preview pane should show a level 2 heading with the text "My New Header"

  Scenario: Mermaid diagram rendering
    Given I have an empty document
    When I paste the following mermaid code into the editor:
      """
      ```mermaid
      flowchart TD
          A[Start] --> B{Is it working?};
          B -->|Yes| C[Great!];
      ```
      """
    Then the preview pane should display a rendered SVG flowchart

  Scenario: GitHub alert rendering
    Given I have an empty document
    When I paste the following alert markdown into the editor:
      """
      > [!NOTE]
      > This is a test note.
      """
    Then the preview pane should display a styled "Note" alert box 