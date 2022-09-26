<script lang="ts">
  let clazz = "";
  export { clazz as class };
  export let topicId: string;
</script>

<picture>
  <source
    type="image/webp"
    srcset={`https://wibxgydawbpuohzsnyzd.supabase.co/storage/v1/object/public/public/images/topics/${topicId}/thumb.webp`}
  />
  <img
    src={`https://wibxgydawbpuohzsnyzd.supabase.co/storage/v1/object/public/public/images/topics/${topicId}/thumb.jpg`}
    alt="Topic thumbnail"
    class={`aspect-video object-cover ${clazz}`}
  />
</picture>
