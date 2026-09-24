import type { Paginated } from "~/types";

type ExtraQuery = () => Record<string, string | undefined>;

/** Daftar berpagination dengan search (debounce), filter, dan penanganan error. */
export const usePaginatedList = <T>(
  endpoint: string,
  extra: ExtraQuery = () => ({}),
  limit = 10,
) => {
  const api = useApi();
  const page = ref(1);
  const search = ref("");
  const loading = ref(false);
  const error = ref("");
  const result = ref<Paginated<T>>({
    data: [],
    page: 1,
    limit,
    total: 0,
    totalPage: 1,
  }) as Ref<Paginated<T>>;
  let requestId = 0;

  const load = async () => {
    const id = ++requestId;
    loading.value = true;
    try {
      const res = await api<unknown>(endpoint, {
        query: {
          page: page.value,
          limit,
          search: search.value.trim() || undefined,
          ...extra(),
        },
      });
      if (id === requestId) {
        result.value = normalizePage<T>(res, limit);
        error.value = "";
      }
    } catch (e) {
      if (id === requestId)
        error.value = getApiErrorMessage(e, "Gagal memuat data.");
    } finally {
      if (id === requestId) loading.value = false;
    }
  };

  const reset = () => {
    if (page.value === 1) load();
    else page.value = 1;
  };

  let timer: ReturnType<typeof setTimeout>;
  watch(search, () => {
    clearTimeout(timer);
    timer = setTimeout(reset, 300);
  });
  watch(() => extra(), reset, { deep: true });
  watch(page, load);
  onMounted(load);

  return { page, search, result, loading, error, load };
};
