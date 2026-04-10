import { Flex, Text } from "@mantine/core";
import Link from "next/link";
import classes from "./Logo.module.css";

export const Logo: React.FC = () => {
  return (
    <Flex direction="row" align="center" gap={4}>
      <Link href="/" style={{ textDecoration: "none" }} className={classes.heading}>
        <Text fw="bolder" size="xl">
          CDSS
          <Text component="span" fw="normal" className={classes.subheading}>
            {" "}Admin
          </Text>
        </Text>
      </Link>
    </Flex>
  );
};
