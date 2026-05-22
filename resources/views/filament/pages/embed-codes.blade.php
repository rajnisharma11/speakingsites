<x-filament-panels::page>
    <div class="space-y-4">
        <x-filament::section>
            <x-slot name="heading">How to use embed codes</x-slot>
            <x-slot name="description">
                Each client has a unique API key. Use the <em>View</em> action to copy the &lt;script&gt; snippet
                and paste it before &lt;/body&gt; on the client's website.
            </x-slot>
        </x-filament::section>

        {{ $this->table }}
    </div>
</x-filament-panels::page>
