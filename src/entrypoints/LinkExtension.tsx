import { buildClient } from "@datocms/cma-client-browser";
import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import {
  Button,
  Canvas,
  CaretDownIcon,
  CaretUpIcon,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  FieldGroup,
} from "datocms-react-ui";
import { useState } from "react";
import recursivellyChangeAllLocales from "../utils/recursivellyChangeAllLocales";
import recursivelyDeleteAllBlockIDs from "../utils/recursivelyDeleteAllBlockIDs";

type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

const LinkExtension = ({ ctx }: PropTypes) => {
  const [selectedLocale, setSelectedLocale] = useState("");

  const fieldValues = ctx.formValues.locale_version as any; //lazy typing fix later

  const fieldHasValueInThisLocale = !!fieldValues[ctx.locale];
  if (fieldHasValueInThisLocale) {
    return <></>;
  }

  const localeOptions = Object.keys(
    ctx.formValues.locale_version as Object
  ).filter((locale) => locale !== ctx.locale);

  const handleLocaleSelection = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setSelectedLocale((event.target as HTMLElement).innerText);
  };

  /* 
  The main logic resides here, all of the outside code is basicly to manage the dropdown and update the form
  Here, in handleContentCopy i:
  - Create a client
  - Duplicate the record linked on the selected locale
  - Fetch that duplicated record
  - Recursively delete all IDs from the fetched record object (Because you can't update records or blocks specifying their IDs)
  - Recursively change all of the locales from the original, to the new one
  (The recursive part is necessary on the previous two functions because i want to do it in the record object, and all of the possible nested blocks inside it)
  - Update the duplicated record to have the new locale
  - Use that updated record ID as a field value for this link field.

  NOTE: I Could, if the content editors ask me to, save the form and navigate the user to the duplicated record by using await ctx.saveCurrentItem() and ctx.navigateTo()
  */

  const handleContentCopy = async () => {
    const client = buildClient({
      apiToken: ctx.currentUserAccessToken as string,
      environment: ctx.environment,
    });

    const selectedRecordID = fieldValues[selectedLocale];

    const copiedRecord = await client.items.duplicate(selectedRecordID);

    const copiedRecordID = copiedRecord.id;

    const duplicatedRecord = (await client.items.find(copiedRecord.id, {
      nested: "true",
    })) as any; //lazy typing part 2

    recursivellyChangeAllLocales(duplicatedRecord, selectedLocale, ctx.locale);

    recursivelyDeleteAllBlockIDs(duplicatedRecord, "");

    delete duplicatedRecord.meta;
    delete duplicatedRecord.creator;

    await client.items.update(copiedRecordID, duplicatedRecord);

    const newLinkValues = fieldValues;
    newLinkValues[ctx.locale] = copiedRecordID;

    await ctx.setFieldValue("locale_version", newLinkValues);
  };

  return (
    <Canvas ctx={ctx}>
      <FieldGroup>
        <Dropdown
          renderTrigger={({ open, onClick }) => (
            <Button
              onClick={onClick}
              rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}
            >
              {selectedLocale || "Locale to copy from"}
            </Button>
          )}
        >
          <DropdownMenu>
            {localeOptions.map((locale) => {
              return (
                <DropdownOption onClick={handleLocaleSelection} key={locale}>
                  {locale}
                </DropdownOption>
              );
            })}
          </DropdownMenu>
        </Dropdown>
        {selectedLocale && (
          <Button onClick={handleContentCopy} style={{ marginTop: "-13px" }}>
            {" "}
            {/* Lazy styling fix later */}
            Copy content from selected locale
          </Button>
        )}
      </FieldGroup>
    </Canvas>
  );
};

export default LinkExtension;
