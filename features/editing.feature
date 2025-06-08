Feature: Real-time Markdown Editing and Preview
  As a user
  I want to see my markdown rendered as I type
  So I can verify my formatting instantly.

  Background:
    Given I am on the MarkVim application
    And I have selected the "split" view mode

  Scenario: Editor content updates the preview
    When I clear the editor content
    And I type "# My Title" into the editor
    Then the preview pane should show an "h1" element with the text "My Title"

    When I type "**important** text" on a new line in the editor
    Then the preview pane should show a "strong" element with the text "important"