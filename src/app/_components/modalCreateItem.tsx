function CreateItemModal({ onClose }) {
  const [name, setName] = useState("");

  const create = api.item.create.useMutation({
    onSuccess: onClose
  });

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-80 space-y-4">

        <h2 className="font-medium">Nuevo Item</h2>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre"
          className="border w-full px-3 py-2 rounded"
        />

        <button
          onClick={() => create.mutate({ name, inventoryId })}
          className="w-full border py-2 rounded"
        >
          Crear
        </button>

      </div>
    </div>
  );
}