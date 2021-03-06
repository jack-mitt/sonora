import React from "react";
import renderer from "react-test-renderer";
import { SearchField } from "../../stories/GlobalSearchField.stories";

test("Search field renders", () => {
    const component = renderer.create(<SearchField />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
