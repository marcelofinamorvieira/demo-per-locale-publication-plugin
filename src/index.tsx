import {
  connect,
  Field,
  FieldIntentCtx,
  RenderFieldExtensionCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import "datocms-react-ui/styles.css";
import LinkExtension from "./entrypoints/LinkExtension";

connect({
  overrideFieldExtensions(field: Field, ctx: FieldIntentCtx) {
    if (field.attributes.api_key === "locale_version") {
      return {
        addons: [{ id: "localeAddon" }],
      };
    }
  },
  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    switch (fieldExtensionId) {
      case "localeAddon":
        return render(<LinkExtension ctx={ctx} />);
    }
  },
});
