import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

import type { BlockUIDesignTokens } from "@primevue/themes/aura/blockui";
import type { MenubarDesignTokens } from "@primevue/themes/aura/menubar";
import type { InplaceDesignTokens } from "@primevue/themes/types/inplace";

const MyPreset = definePreset(Aura, {
  components: {
    blockui: {
      root: { borderRadius: "0" },
    } satisfies BlockUIDesignTokens,
    menubar: {
      root: { background: "{primary.600}", color: "{surface.0}", borderRadius: "0", borderColor: "none" },
      item: { focusBackground: "{primary.700}", color: "{surface.0}", focusColor: "{surface.0}" },
      mobileButton: { hoverBackground: "{primary.700}", color: "{surface.0}", hoverColor: "{surface.0}" },
      submenu: { background: "{primary.800}", borderRadius: "0", borderColor: "none" },
    } satisfies MenubarDesignTokens,
    inplace: {
      root: { padding: "0" },
    } satisfies InplaceDesignTokens,
  },
});

export default {
  preset: MyPreset,
  options: { darkModeSelector: "" },
};
