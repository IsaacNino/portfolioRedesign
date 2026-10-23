// Editorial process studies grounded in the portfolio projects, not live system telemetry.
export const practices = {
  systems: {
    label: 'Systems', projectId: 'intrust', caption: 'Document assembly / InTrust process study',
    tools: 'React / Rust / Tauri / Document automation',
    layers: [
      { id:'intake', label:'Intake', title:'Turn a conversation into structured input.', description:'A document workflow starts with people and their answers. Guided intake gives the information a consistent shape before it reaches the drafting logic.', parts:[['Capture','People, relationships, and answers'],['Structure','Named fields and repeatable records'],['Intent','Less re-entry between documents']] },
      { id:'logic', label:'Rules', title:'Make the decisions explicit.', description:'Rule-based logic connects intake information to the right document content. Separating those decisions from presentation makes the workflow easier to reason about and adapt.', parts:[['Inputs','Structured intake values'],['Decisions','Conditions and content selection'],['Mapping','Data matched to document templates']] },
      { id:'assembly', label:'Assembly', title:'Generate a document, not a wall of text.', description:'The final artifact needs structure, styles, and careful formatting. InTrust turns the selected content into Word documents while respecting the conventions of legal drafting.', parts:[['Structure','Sections, paragraphs, and clauses'],['Presentation','Word styles and formatting'],['Artifact','A coordinated DOCX package']] },
      { id:'review', label:'Refinement', title:'Keep precision in the loop.', description:'Document automation is an iterative craft. The generated package is where content choices, formatting, and the original intake need to come together coherently.', parts:[['Look for','Content and formatting consistency'],['Refine','Templates and workflow behavior'],['Principle','Human judgment stays involved']] }
    ]
  },
  ai: {
    label:'Applied AI', projectId:'postcard', caption:'Personalization / CES postcard process study',
    tools:'Creative direction / Prompt matrix / FLUX / JavaScript',
    layers:[
      { id:'brief', label:'Brief', title:'Start with the feeling you want to create.', description:'The CES postcard experience begins with a visitor’s mindset. A short interaction gives the generative system a personal direction without turning the experience into a long form.', parts:[['Context','An event, a person, a moment'],['Interaction','A short mobile prompt flow'],['Goal','A memorable, personal artifact']] },
      { id:'prompt', label:'Prompt', title:'Give the idea a visual grammar.', description:'A prompt matrix connects personal input to creative direction. The variable ingredients change while the overall visual frame stays recognizable.', parts:[['Variable','Visitor mindset and chosen direction'],['Consistent','Composition and visual framing'],['Craft','Prompt choices that work together']] },
      { id:'generation', label:'Generate', title:'Turn direction into something tangible.', description:'Generative media bridges the visitor’s choices and a postcard composition. The interface makes that transition feel like one experience, from the first question to the finished image.', parts:[['Material','Personalized prompt direction'],['Medium','FLUX-generated imagery'],['Frame','A consistent postcard composition']] },
      { id:'iteration', label:'Refine', title:'Taste closes the loop.', description:'A useful AI experiment involves creative judgment around the model: shaping prompts, considering the composition, and refining the experience around the output.', parts:[['Review','Does the visual match the intent?'],['Adjust','Prompt language and framing'],['Outcome','A shareable creative artifact']] }
    ]
  },
  interaction: {
    label:'Interaction', projectId:'gallery', caption:'Interface states / Dell gallery process study',
    tools:'Spatial layout / State transitions / Media / JavaScript',
    layers:[
      { id:'browse', label:'Browse', title:'Make a collection feel discoverable.', description:'The gallery organizes stories as a visual field. Large tiles give visitors a way into the content while making sense on a large-format display.', parts:[['Structure','A collection of story tiles'],['Hierarchy','Image-led entry points'],['Context','A fullscreen display environment']] },
      { id:'select', label:'Select', title:'Make the next move feel obvious.', description:'Tile behavior connects curiosity to action. The visual response should help someone understand which story they are entering without losing the broader collection.', parts:[['Trigger','A visitor chooses a story'],['Feedback','The selected tile becomes the focus'],['Continuity','Keep the spatial context legible']] },
      { id:'focus', label:'Immerse', title:'Give the story room to unfold.', description:'Modal content and embedded video create a focused view within the gallery. The layout shifts from browsing many stories to engaging with one.', parts:[['State','Focused story view'],['Content','Narrative and rich media'],['Attention','A clear foreground and background']] },
      { id:'return', label:'Return', title:'The way back is part of the experience.', description:'An immersive view still needs an understandable exit. The transition back to the collection completes the interaction and invites another discovery.', parts:[['Action','Close the focused story'],['Destination','The gallery collection'],['Rhythm','Explore, focus, return, repeat']] }
    ]
  },
  web: {
    label:'Web & design', projectId:'dogwood', caption:'Content & layout / Dogwood process study',
    tools:'Information architecture / Visual design / Responsive UI / SEO',
    layers:[
      { id:'structure', label:'Structure', title:'Answer the questions people arrive with.', description:'For a counseling site, the content needs to explain who the practice helps and how to take the next step. Clear information architecture makes that journey easier to follow.', parts:[['Orientation','Who this practice is for'],['Clarity','Services and approach'],['Path','A clear route to contact']] },
      { id:'identity', label:'Identity', title:'Let the visual tone do useful work.', description:'A calm, warm visual language supports the emotional context of therapy. Typography, spacing, and image choices all contribute to an approachable first impression.', parts:[['Typography','An easy reading rhythm'],['Space','Room to absorb the information'],['Tone','Warmth, trust, and approachability']] },
      { id:'responsive', label:'Adapt', title:'Keep the intent as the screen changes.', description:'The same content needs a different arrangement on a phone. The layout study shows how hierarchy and the contact path can stay clear as columns collapse and reading order changes.', parts:[['Desktop','Space for complementary content'],['Mobile','A clear, linear reading order'],['Constant','The purpose of each section']] },
      { id:'contact', label:'Connect', title:'Make the next step feel accessible.', description:'A considered site gives people a clear way to act. Service framing, local discoverability, and accessible contact pathways work together around that goal.', parts:[['Find','Local context and light SEO'],['Understand','Straightforward service information'],['Act','A visible contact pathway']] }
    ]
  }
};
