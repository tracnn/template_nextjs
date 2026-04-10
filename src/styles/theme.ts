"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
	fontFamily: "'Be Vietnam Pro', sans-serif",
	headings: {
		fontFamily: "'Be Vietnam Pro', sans-serif",
		fontWeight: "700",
	},
	shadows: {
		xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
		sm: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	},
	colors: {
		primary: [
			"#ecefff",
			"#d5dafb",
			"#a9b1f1",
			"#7a87e9",
			"#5362e1",
			"#3a4bdd",
			"#2c40dc",
			"#1f32c4",
			"#182cb0",
			"#0a259c",
		],
	},
	primaryColor: "primary",
	defaultRadius: "md",
	components: {
		Card: {
			defaultProps: {
				shadow: "sm",
				withBorder: true,
			},
			styles: {
				root: {
					transition: "transform 0.2s ease, box-shadow 0.2s ease",
				},
			},
		},
	},
});
