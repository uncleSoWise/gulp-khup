// Tests for the promptUser function in cli.js.
// @clack/prompts is mocked — these tests verify the integration wiring
// (intro called, group called with correct shape, cancel + exit on Ctrl-C)
// without requiring an actual terminal.

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  group: vi.fn(),
  cancel: vi.fn(),
  outro: vi.fn(),
  text: vi.fn().mockResolvedValue('mocked-text'),
  select: vi.fn().mockResolvedValue('web'),
  log: { step: vi.fn(), error: vi.fn() },
}));

import * as p from '@clack/prompts';
import { promptUser } from '../src/cli.js';

const mockValues = {
  projectName: 'my-project',
  description: 'A test project',
  authorName: 'Test Author',
  authorEmail: 'test@example.com',
  projectType: 'web',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('promptUser', () => {
  it('calls p.intro with the package name', async () => {
    p.group.mockResolvedValueOnce(mockValues);
    await promptUser({});
    expect(p.intro).toHaveBeenCalledWith('create-gulp-khup');
  });

  it('calls p.group to collect project details', async () => {
    p.group.mockResolvedValueOnce(mockValues);
    await promptUser({});
    expect(p.group).toHaveBeenCalledOnce();
  });

  it('returns the values from p.group', async () => {
    p.group.mockResolvedValueOnce(mockValues);
    const result = await promptUser({});
    expect(result).toEqual(mockValues);
  });

  it('passes initialName as initialValue for the projectName prompt', async () => {
    p.group.mockResolvedValueOnce(mockValues);
    await promptUser({ projectName: 'pre-filled-name' });

    // p.group is called with (fieldsObject, options)
    // The fields object is the first arg — each field is a function
    const [fieldsObj] = p.group.mock.calls[0];
    expect(typeof fieldsObj.projectName).toBe('function');
  });

  it('invokes all field functions and calls p.text / p.select for each prompt', async () => {
    // Make p.group actually invoke the field functions — this covers the
    // arrow function bodies inside the group call (lines 54-85 in cli.js)
    p.group.mockImplementationOnce(async (fieldsObj) => {
      for (const fn of Object.values(fieldsObj)) {
        await fn();
      }
      return mockValues;
    });

    await promptUser({ projectName: 'my-project' });

    // p.text called for projectName, description, authorName, authorEmail (4×)
    expect(p.text).toHaveBeenCalledTimes(4);
    // p.select called for projectType (1×)
    expect(p.select).toHaveBeenCalledTimes(1);
  });

  it('calls p.cancel and process.exit(0) when onCancel is triggered', async () => {
    // Make p.group invoke the onCancel callback to simulate Ctrl-C
    p.group.mockImplementationOnce(async (_fields, { onCancel }) => {
      onCancel();
    });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(promptUser({})).rejects.toThrow('process.exit called');

    expect(p.cancel).toHaveBeenCalledWith('Cancelled — no files were created.');
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  it('passes initialValues.projectName as initialValue to the projectName prompt', async () => {
    p.group.mockImplementationOnce(async (fieldsObj) => {
      await fieldsObj.projectName();
      return mockValues;
    });
    await promptUser({ projectName: 'pre-filled' });
    expect(p.text).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: 'pre-filled' })
    );
  });

  it('passes initialValues.description as initialValue to the description prompt', async () => {
    p.group.mockImplementationOnce(async (fieldsObj) => {
      await fieldsObj.description();
      return mockValues;
    });
    await promptUser({ description: 'pre-filled desc' });
    expect(p.text).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: 'pre-filled desc' })
    );
  });

  it('passes initialValues.authorName as initialValue to the authorName prompt', async () => {
    p.group.mockImplementationOnce(async (fieldsObj) => {
      await fieldsObj.authorName();
      return mockValues;
    });
    await promptUser({ authorName: 'Override Author' });
    expect(p.text).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: 'Override Author' })
    );
  });

  it('passes initialValues.authorEmail as initialValue to the authorEmail prompt', async () => {
    p.group.mockImplementationOnce(async (fieldsObj) => {
      await fieldsObj.authorEmail();
      return mockValues;
    });
    await promptUser({ authorEmail: 'override@example.com' });
    expect(p.text).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: 'override@example.com' })
    );
  });

  it('passes initialValues.projectType as initialValue to the projectType prompt', async () => {
    p.group.mockImplementationOnce(async (fieldsObj) => {
      await fieldsObj.projectType();
      return mockValues;
    });
    await promptUser({ projectType: 'wordpress' });
    expect(p.select).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: 'wordpress' })
    );
  });
});
