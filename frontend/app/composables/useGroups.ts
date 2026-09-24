import type { Group, Paginated } from "~/types";

export interface GroupNode extends Group {
  children: GroupNode[];
}

/** Shared state: groups drive the sidebar menu / submenu. */
export const useGroups = () => {
  const api = useApi();
  const groups = useState<Group[]>("groups", () => []);
  const refresh = async () => {
    const res = await api<Paginated<Group>>("/credential-groups", {
      query: { limit: 100 },
    });
    groups.value = res.data;
  };
  const tree = computed<GroupNode[]>(() => {
    const map = new Map<string, GroupNode>(
      groups.value.map((g) => [g.id, { ...g, children: [] }]),
    );
    const roots: GroupNode[] = [];
    map.forEach((n) =>
      n.parentId && map.get(n.parentId)
        ? map.get(n.parentId)!.children.push(n)
        : roots.push(n),
    );
    return roots;
  });
  return { groups, tree, refresh };
};
