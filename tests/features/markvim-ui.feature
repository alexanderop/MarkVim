Feature: MarkVim UI Elements

  Scenario: Essential UI components are present
    Given I open the MarkVim homepage
    Then the following elements are visible
      | testid                      |
      | header-toolbar              |
      | editor-pane                 |
      | preview-pane                |
      | status-bar                  |

  Scenario: Command palette can be opened
    Given I open the MarkVim homepage  
    When I press "Cmd+K"
    Then the command palette should be visible
    And the search input should be focused

  Scenario: Split view mode works correctly
    Given I open the MarkVim homepage
    Then both editor and preview panes should be visible
    And the view mode toggle should be present

  Scenario: Sidebar functionality works
    Given I open the MarkVim homepage
    Then the document list should be visible
    And the create document button should be present 