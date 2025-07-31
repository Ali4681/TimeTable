import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { docTeachService } from "../docTeach.service";
import { DocTeach } from "../docTeach.type";

export const useDocTeach = () => {
  const queryClient = useQueryClient();

  const fetchAll = useQuery({
    queryKey: ["docTeach"],
    queryFn: docTeachService.getAll,
  });

  const fetchById = (id: string) =>
    useQuery({
      queryKey: ["docTeach", id],
      queryFn: () => docTeachService.getById(id),
      enabled: !!id,
    });

  const create = useMutation({
    mutationFn: docTeachService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docTeach"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocTeach }) =>
      docTeachService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docTeach"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => docTeachService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docTeach"] }),
  });

  return {
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
};
