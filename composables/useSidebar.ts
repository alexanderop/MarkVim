export function useSidebar() {
  const isSidebarVisible = useLocalStorage('markvim-sidebar-visible', true)

  function toggleSidebar() {
    isSidebarVisible.value = !isSidebarVisible.value
  }

  return {
    isSidebarVisible,
    toggleSidebar,
  }
}
