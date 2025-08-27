import { supabase }  from "@/lib/fetchNews";



// function
export async function updateReaction(articleId: number, type: "like" | "dislike") {
  const col = type === "like" ? "likes" : "dislikes";

  // Ask Supabase to return a typed object
  const { data: current, error: fetchError } = await supabase
    .from("news")
    .select("likes, dislikes")
    .eq("id", articleId)
    .single();

  if (fetchError) {
    console.error("fetch error:", fetchError);
    return null;
  }

  // read the value in a typed way (no bracket indexing on `any`)
  const currentValue = col === "likes" ? (current?.likes ?? 0) : (current?.dislikes ?? 0);
  const newCount = currentValue + 1;

  // create a properly typed update object
  const updateObj = col === "likes" ? { likes: newCount } : { dislikes: newCount };

  const { data, error } = await supabase
    .from("news")
    .update(updateObj)
    .eq("id", articleId)
    .select()
    .single();

  if (error) {
    console.error("update error:", error);
    return null;
  }

  return data;
}
