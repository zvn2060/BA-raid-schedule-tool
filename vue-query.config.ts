export default defineVueQueryPluginHook(({ queryClient }) => {
  queryClient.setDefaultOptions({
    queries: { staleTime: Infinity },
  });
  return {
    pluginReturn: { provide: { } }, // nuxt plugin return value
    vueQueryPluginOptions: { queryClient }, // You can pass dynamic options
  };
});
