import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container py-20">
      <h1 className="font-display text-5xl font-black italic mb-8">
        Em Construção
      </h1>
      <p className="text-muted mb-12 max-w-2xl">
        O site VYRAL está sendo preparado. Abaixo você vê os 3 estilos de botão
        para validação visual.
      </p>

      {/* Button variants showcase */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Button variant="primary">Comprar Agora</Button>
        <Button variant="ghost">Saiba Mais</Button>
        <Button variant="cyan">Conferir</Button>
      </div>

      {/* Disabled states */}
      <div className="mt-8">
        <p className="text-muted text-sm mb-3">Estados desativados:</p>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Button variant="primary" disabled>
            Comprar Agora
          </Button>
          <Button variant="ghost" disabled>
            Saiba Mais
          </Button>
          <Button variant="cyan" disabled>
            Conferir
          </Button>
        </div>
      </div>
    </div>
  );
}
