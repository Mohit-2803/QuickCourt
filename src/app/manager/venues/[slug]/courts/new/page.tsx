import AddCourtForm from "@/components/manager/venue/add-court-form";

export default function NewCourtPage({ params }: { params: { slug: string } }) {
  return (
    <div className="mx-auto w-full max-w-2xl p-6 md:p-8">
      <AddCourtForm slug={params.slug} />
    </div>
  );
}
