import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPAge() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let UpdatedAtText = "Carregando...";

  if (!isLoading && data) {
    UpdatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {UpdatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let dataBaseStatusInformation = "Carregando...";

  if (!isLoading && data) {
    dataBaseStatusInformation = (
      <>
        <div>Versão: {data.dependencies.database.version}</div>
        <div>
          Conexões abertas: {data.dependencies.database.opened_connections}
        </div>
        <div>
          Conexões máximas: {data.dependencies.database.max_connections}
        </div>
      </>
    );
  }

  return (
    <>
      <h2>database</h2>
      <div>{dataBaseStatusInformation}</div>
    </>
  );
}
