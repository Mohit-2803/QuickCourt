import AddCourtForm from "@/components/manager/venue/add-court-form";

export const metadata = {
  title: "Add Court",
  description: "Add a new court to your sports venue.",
};

export default async function NewCourtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto w-full max-w-2xl p-6 md:p-8">
      <AddCourtForm slug={slug} />
    </div>
  );
}
