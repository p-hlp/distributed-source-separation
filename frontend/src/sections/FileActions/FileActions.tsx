import { Box, Divider, List, Stack } from "@mui/material";
import { SectionBar } from "../../components/SectionBar";
import { DownloadLibraryAction } from "./DownloadLibraryAction";
import { DownloadMidiAction } from "./DownloadMidiAction";
import { SeparationAction } from "./SeparateAction";
import { TransrcibeAction } from "./TranscribeAction";

interface ActionItem {
  key: string;
  component: () => JSX.Element;
}

const actionConfig: ActionItem[] = [
  {
    key: "separate",
    component: SeparationAction,
  },
  {
    key: "download",
    component: DownloadMidiAction,
  },
  {
    key: "transcribe",
    component: TransrcibeAction,
  },
  {
    key: "download-library",
    component: DownloadLibraryAction,
  },
];

export const FileActions = () => {
  return (
    <Stack width={"100%"} height={"100%"} direction="column">
      <SectionBar sectionTitle="Actions" />
      <Divider />
      <Box width={"100%"} height={"100%"} overflow="auto">
        <List disablePadding>
          {actionConfig.map((a) => {
            const ActionComponent = a.component;
            return <ActionComponent key={a.key} />;
          })}
        </List>
      </Box>
    </Stack>
  );
};
